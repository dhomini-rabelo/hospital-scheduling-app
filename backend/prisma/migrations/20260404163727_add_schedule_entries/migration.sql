-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedule_entry_team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_entry_id" TEXT NOT NULL,
    "team_member_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "schedule_entry_team_members_schedule_entry_id_fkey" FOREIGN KEY ("schedule_entry_id") REFERENCES "schedule_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_entry_team_members_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_entries_date_key" ON "schedule_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_entry_team_members_schedule_entry_id_team_member_id_key" ON "schedule_entry_team_members"("schedule_entry_id", "team_member_id");
