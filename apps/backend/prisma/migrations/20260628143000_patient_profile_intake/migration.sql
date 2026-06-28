ALTER TABLE "PatientProfile"
  ADD COLUMN "fullName" TEXT,
  ADD COLUMN "residenceCity" TEXT,
  ADD COLUMN "genderIdentity" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "travelRadiusKm" INTEGER,
  ADD COLUMN "travelPreferences" JSONB;

CREATE INDEX "PatientProfile_countryCode_residenceCity_idx"
  ON "PatientProfile"("countryCode", "residenceCity");
