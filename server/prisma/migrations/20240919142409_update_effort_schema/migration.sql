-- CreateTable
CREATE TABLE "EffortEstimations" (
    "id" SERIAL NOT NULL,
    "issue_id" TEXT NOT NULL,
    "estimated_effort" DOUBLE PRECISION NOT NULL,
    "estimation_uncertainty" DOUBLE PRECISION NOT NULL,
    "total_effort" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EffortEstimations_pkey" PRIMARY KEY ("id")
);
