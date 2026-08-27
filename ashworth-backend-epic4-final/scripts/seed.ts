/* eslint-disable no-console */
import { connectDB } from "../src/config/db";
import { Club } from "../src/models/Club";
import mongoose from "mongoose";

const clubs = [
  {
    slug: "club-one",
    name: "Club One",
    tagline: "Where ambition meets community",
    heroImageUrl: "https://example.com/images/club-one-hero.jpg",
    whoWeAre: "Club One is a members-only network for founders and operators.",
    whatIsUnique: "Curated, intimate gatherings capped at 50 members per city.",
    whoShouldJoin: "Founders, operators, and senior leaders building something new.",
    howYouBenefit: "Access to a trusted peer network, curated events, and mentorship.",
    whatWeOffer: {
      purpose: "Connect ambitious builders with each other.",
      features: ["Monthly dinners", "Annual retreat", "Private directory"],
      benefits: ["Peer mentorship", "Deal flow", "Lifelong friendships"],
    },
    membershipFee: { amount: 25000, currency: "INR" },
    membershipOpen: true,
  },
  {
    slug: "club-two",
    name: "Club Two",
    tagline: "For the creatively restless",
    heroImageUrl: "https://example.com/images/club-two-hero.jpg",
    whoWeAre: "A collective for designers, artists, and creative technologists.",
    whatIsUnique: "Hands-on workshops led by working practitioners, not lecturers.",
    whoShouldJoin: "Anyone building a creative practice alongside their day job.",
    howYouBenefit: "Studio access, critique sessions, and a supportive peer group.",
    whatWeOffer: {
      purpose: "Give creative professionals room to experiment.",
      features: ["Shared studio hours", "Quarterly showcase", "Skill swaps"],
      benefits: ["Honest feedback", "Collaborators", "Exhibition opportunities"],
    },
    membershipFee: { amount: 18000, currency: "INR" },
    membershipOpen: true,
  },
  {
    slug: "club-three",
    name: "Club Three",
    tagline: "Wellness, taken seriously",
    heroImageUrl: "https://example.com/images/club-three-hero.jpg",
    whoWeAre: "A health-first club combining fitness, nutrition, and recovery.",
    whatIsUnique: "Personalized programming backed by quarterly biomarker testing.",
    whoShouldJoin: "Members who want a structured, data-informed approach to health.",
    howYouBenefit: "Coaching, recovery facilities, and a community that keeps you accountable.",
    whatWeOffer: {
      purpose: "Make long-term health a habit, not a phase.",
      features: ["Biomarker testing", "1:1 coaching", "Recovery suite access"],
      benefits: ["Personalized plans", "Accountability", "Measurable progress"],
    },
    membershipFee: { amount: 32000, currency: "INR" },
    membershipOpen: true,
  },
  {
    slug: "club-four",
    name: "Club Four",
    tagline: "A table for good conversation",
    heroImageUrl: "https://example.com/images/club-four-hero.jpg",
    whoWeAre: "A dining and discourse club for the curious.",
    whatIsUnique: "Themed dinners paired with a guest speaker each month.",
    whoShouldJoin: "People who miss long dinners with genuinely interesting conversation.",
    howYouBenefit: "A recurring reason to meet new people and hear new ideas.",
    whatWeOffer: {
      purpose: "Bring good food and good conversation back together.",
      features: ["Monthly themed dinners", "Guest speakers", "Small tables of 8"],
      benefits: ["New perspectives", "New friends", "No small talk required"],
    },
    membershipFee: { amount: 20000, currency: "INR" },
    membershipOpen: true,
  },
];

async function seed() {
  await connectDB();
  for (const club of clubs) {
    await Club.updateOne({ slug: club.slug }, { $set: club }, { upsert: true });
    console.log(`Upserted ${club.slug}`);
  }
  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
