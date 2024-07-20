/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subscription` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- Créer un nouvel énumérateur pour les types d'abonnement
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PREMIUM', 'GOLD');

-- Ajouter la colonne `subscription` avec une valeur par défaut pour les utilisateurs existants
ALTER TABLE "User" ADD COLUMN "subscription" "SubscriptionType" NOT NULL DEFAULT 'FREE';

-- Supprimer la clé étrangère associée à `subscriptionId`
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionId_fkey";

-- Supprimer la colonne `subscriptionId`
ALTER TABLE "User" DROP COLUMN "subscriptionId";

-- Supprimer la table `Subscription` si elle est vide (assurez-vous que la table est vide avant cette opération)
DROP TABLE "Subscription";

