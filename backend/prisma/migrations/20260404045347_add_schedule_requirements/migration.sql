-- CreateTable
CREATE TABLE "schedule_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_reference" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_requirements_date_reference_key" ON "schedule_requirements"("date_reference");
