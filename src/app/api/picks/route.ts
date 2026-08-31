import { NextResponse } from "next/server";
import {
  findPickFixtureById,
  isPickOpen,
} from "@/lib/football/fixtures-server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PickRow = {
  fixture_id: string;
  home_score: number;
  away_score: number;
  gameweek: number;
};

function rowsToRecord(rows: PickRow[]) {
  const picks: Record<string, [number, number]> = {};
  for (const row of rows) {
    picks[row.fixture_id] = [row.home_score, row.away_score];
  }
  return picks;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to view your picks." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameweek = Number(searchParams.get("gw") || 0);

    let query = supabase
      .from("picks")
      .select("fixture_id, home_score, away_score, gameweek")
      .eq("user_id", user.id);

    if (gameweek > 0) {
      query = query.eq("gameweek", gameweek);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      picks: rowsToRecord((data ?? []) as PickRow[]),
      gameweek: gameweek > 0 ? gameweek : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load picks.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function gameweekFromFixture(fixture: { round: string | null }, fallback: number) {
  const match = fixture.round?.match(/(\d+)/);
  return match ? Number(match[1]) : fallback;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to save picks." }, { status: 401 });
    }

    const body = (await request.json()) as {
      fixtureId?: string;
      homeScore?: number;
      awayScore?: number;
      gameweek?: number;
    };

    const fixtureId = body.fixtureId?.trim();
    const homeScore = body.homeScore;
    const awayScore = body.awayScore;
    const gameweek = body.gameweek;

    if (!fixtureId) {
      return NextResponse.json({ error: "fixtureId is required." }, { status: 400 });
    }

    if (
      typeof homeScore !== "number" ||
      typeof awayScore !== "number" ||
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      homeScore > 9 ||
      awayScore < 0 ||
      awayScore > 9
    ) {
      return NextResponse.json(
        { error: "Scores must be whole numbers from 0 to 9." },
        { status: 400 },
      );
    }

    if (
      typeof gameweek !== "number" ||
      !Number.isInteger(gameweek) ||
      gameweek < 1 ||
      gameweek > 38
    ) {
      return NextResponse.json(
        { error: "gameweek must be between 1 and 38." },
        { status: 400 },
      );
    }

    const fixture = await findPickFixtureById(fixtureId);
    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found." }, { status: 404 });
    }

    if (!isPickOpen(fixture)) {
      return NextResponse.json(
        { error: "Picks are locked for this fixture." },
        { status: 403 },
      );
    }

    const resolvedGameweek = gameweekFromFixture(fixture, gameweek);

    const { error } = await supabase.from("picks").upsert(
      {
        user_id: user.id,
        fixture_id: fixtureId,
        home_score: homeScore,
        away_score: awayScore,
        gameweek: resolvedGameweek,
      },
      { onConflict: "user_id,fixture_id" },
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      pick: [homeScore, awayScore] as [number, number],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save pick.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
