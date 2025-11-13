-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_collaboratorId_fkey";

-- CreateTable
CREATE TABLE "_OrderCollaborators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderCollaborators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderCollaborators_B_index" ON "_OrderCollaborators"("B");

-- AddForeignKey
ALTER TABLE "_OrderCollaborators" ADD CONSTRAINT "_OrderCollaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "Collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderCollaborators" ADD CONSTRAINT "_OrderCollaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
