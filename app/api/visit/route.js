import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = "SELECT value FROM site_stats WHERE key = 'home_visits'";
        const { rows } = await pool.query(query);
        
        const count = rows.length > 0 ? rows[0].value : 0;
        return NextResponse.json({ count: parseInt(count) });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch visit count." },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        // Increment the count. If the record doesn't exist, it should have been created by init.sql
        // But let's be safe and use an UPSERT like query or just update
        const query = `
            INSERT INTO site_stats (key, value) 
            VALUES ('home_visits', 1) 
            ON CONFLICT (key) 
            DO UPDATE SET value = site_stats.value + 1
            RETURNING value
        `;
        const { rows } = await pool.query(query);
        
        return NextResponse.json({ count: parseInt(rows[0].value) });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to increment visit count." },
            { status: 500 }
        );
    }
}
