-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "phases" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileAnalysisId" TEXT NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_profileAnalysisId_key" ON "Roadmap"("profileAnalysisId");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_profileAnalysisId_fkey" FOREIGN KEY ("profileAnalysisId") REFERENCES "ProfileAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
