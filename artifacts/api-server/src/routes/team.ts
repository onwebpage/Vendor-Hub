import { Router } from "express";
import { db } from "@workspace/db";
import { teamMembersTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const members = await db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.isVisible, true))
      .orderBy(asc(teamMembersTable.displayOrder), asc(teamMembersTable.id));
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch team members" });
  }
});

export default router;
