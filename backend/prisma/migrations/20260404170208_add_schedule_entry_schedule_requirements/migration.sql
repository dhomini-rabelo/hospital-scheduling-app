-- CreateTable
CREATE TABLE "schedule_entry_schedule_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_entry_id" TEXT NOT NULL,
    "schedule_requirement_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "schedule_entry_schedule_requirements_schedule_entry_id_fkey" FOREIGN KEY ("schedule_entry_id") REFERENCES "schedule_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_entry_schedule_requirements_schedule_requirement_id_fkey" FOREIGN KEY ("schedule_requirement_id") REFERENCES "schedule_requirements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_entry_schedule_requirements_schedule_entry_id_schedule_requirement_id_key" ON "schedule_entry_schedule_requirements"("schedule_entry_id", "schedule_requirement_id");
