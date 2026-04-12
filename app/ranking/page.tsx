"use client";

import { useEffect, useState } from "react";
import { FaFire, FaCrown } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { NavMenu } from "@/components/common/navMenu";
import { FaRankingStar } from "react-icons/fa6";

type UserRank = {
  id: string;
  name: string;
  image?: string;
  xp: number;
  level: number;
  streak: number;
  isPro?: boolean;
};

export default function RankingPage() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRanking = async () => {
      const res = await fetch("/api/ranking");
      const data = await res.json();

      const sorted = [...data].sort((a, b) => b.xp - a.xp);
      setUsers(sorted);
      setFilteredUsers(sorted);
      setLoading(false);
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredUsers(filtered);
  }, [search, users]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400 animate-pulse">
        <FaRankingStar /> Carregando ranking...
      </div>
    );
  }

  const top3 = users.slice(0, 3);

  const rest = search
    ? filteredUsers
    : filteredUsers.filter((u) => !top3.some((t) => t.id === u.id));

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-5xl mx-auto mb-16">
        {/* HEADER */}
        <h1 className="text-4xl font-bold bg-linear-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent mb-6">
          <FaRankingStar className="text-amber-600" /> Ranking Wisdom
        </h1>

        {/* SEARCH */}
        <input
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-10 p-3 rounded-xl bg-[#111] border border-white/10 focus:border-orange-400 outline-none"
        />

        {/* TOP 3 */}
        {!search && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {/* FIRST */}
            {top3[0] && (
              <div className="relative p-6 rounded-3xl text-center overflow-hidden bg-linear-to-br from-yellow-400/30 via-orange-500/30 to-black border border-yellow-400 shadow-[0_0_70px_rgba(255,200,0,0.5)]">
                {top3[0].isPro && (
                  <div className="absolute inset-0 bg-yellow-300/20 blur-3xl animate-pulse" />
                )}

                <FaCrown className="mx-auto text-yellow-300 text-4xl mb-3 relative z-10" />

                <img
                  src={top3[0].image || "/wisdom.svg"}
                  className={`w-24 h-24 mx-auto rounded-full mb-3 relative z-10 ${
                    top3[0].isPro
                      ? "border-4 border-yellow-400 shadow-[0_0_20px_rgba(255,200,0,0.6)]"
                      : "border-2 border-orange-400"
                  }`}
                />

                <p className="font-bold text-xl flex items-center justify-center gap-2 relative z-10">
                  {top3[0].name}
                  {top3[0].isPro && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-300 text-black rounded-full font-bold animate-pulse">
                      ELITE
                    </span>
                  )}
                </p>

                <p className="text-xs text-yellow-300 mt-1 relative z-10">
                  #1 CAMPEÃO
                </p>

                <div className="flex justify-center gap-4 mt-3 relative z-10">
                  <span className="text-yellow-300 flex items-center gap-1">
                    <BsStars /> {top3[0].xp}
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <FaFire /> {top3[0].streak}
                  </span>
                </div>
              </div>
            )}

            {/* SECOND */}
            {top3[1] && (
              <div className="relative p-5 rounded-3xl text-center bg-linear-to-br from-gray-300/20 to-black border border-gray-400 overflow-hidden">
                {top3[1].isPro && (
                  <div className="absolute inset-0 bg-yellow-300/10 blur-2xl animate-pulse" />
                )}

                <FaCrown className="mx-auto text-gray-300 text-3xl mb-3 relative z-10" />

                <img
                  src={top3[1].image || "/wisdom.svg"}
                  className={`w-20 h-20 mx-auto rounded-full mb-3 relative z-10 ${
                    top3[1].isPro
                      ? "border-2 border-yellow-400 shadow"
                      : "border-2 border-gray-400"
                  }`}
                />

                <p className="font-semibold text-lg flex items-center justify-center gap-2 relative z-10">
                  {top3[1].name}
                  {top3[1].isPro && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-300 text-black rounded-full font-bold animate-pulse">
                      PRO
                    </span>
                  )}
                </p>

                <p className="text-xs text-gray-400 relative z-10">#2 Lugar</p>

                <div className="flex justify-center gap-4 mt-3 relative z-10">
                  <span className="text-orange-400 flex items-center gap-1">
                    <BsStars /> {top3[1].xp}
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <FaFire /> {top3[1].streak}
                  </span>
                </div>
              </div>
            )}

            {/* THIRD */}
            {top3[2] && (
              <div className="relative p-5 rounded-3xl text-center bg-linear-to-br from-orange-900/30 to-black border border-orange-800 overflow-hidden">
                {top3[2].isPro && (
                  <div className="absolute inset-0 bg-yellow-300/10 blur-2xl animate-pulse" />
                )}

                <FaCrown className="mx-auto text-orange-700 text-3xl mb-3 relative z-10" />

                <img
                  src={top3[2].image || "/wisdom.svg"}
                  className={`w-20 h-20 mx-auto rounded-full mb-3 relative z-10 ${
                    top3[2].isPro
                      ? "border-2 border-yellow-400 shadow"
                      : "border-2 border-orange-700"
                  }`}
                />

                <p className="font-semibold text-lg text-orange-300 flex items-center justify-center gap-2 relative z-10">
                  {top3[2].name}
                  {top3[2].isPro && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-300 text-black rounded-full font-bold animate-pulse">
                      PRO
                    </span>
                  )}
                </p>

                <p className="text-xs text-orange-500 relative z-10">
                  #3 Lugar
                </p>

                <div className="flex justify-center gap-4 mt-3 relative z-10">
                  <span className="text-orange-400 flex items-center gap-1">
                    <BsStars /> {top3[2].xp}
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <FaFire /> {top3[2].streak}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LISTA */}
        <div className="space-y-3">
          {rest.map((user) => {
            const position = users.findIndex((u) => u.id === user.id) + 1;

            return (
              <div
                key={user.id}
                className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                  user.isPro
                    ? "bg-linear-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-400/40 shadow-[0_0_20px_rgba(255,200,0,0.25)] scale-[1.02]"
                    : "bg-[#111] border border-white/10 hover:border-orange-400/30"
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                      user.isPro
                        ? "bg-yellow-400/20 text-yellow-300"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {position}
                  </div>

                  <img
                    src={user.image || "/wisdom.svg"}
                    className={`rounded-full ${
                      user.isPro
                        ? "w-12 h-12 border-2 border-yellow-400 shadow"
                        : "w-10 h-10"
                    }`}
                  />

                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      {user.name}

                      {user.isPro && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-linear-to-r from-yellow-300 to-orange-400 text-black rounded-full font-bold">
                          <FaCrown /> PRO
                        </span>
                      )}
                    </p>

                    <div className="w-full h-1.5 bg-black mt-1 rounded overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-orange-400 to-yellow-400"
                        style={{
                          width: `${Math.min(user.xp % 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="text-orange-400 flex items-center gap-1">
                    <BsStars /> {user.xp}
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <FaFire /> {user.streak}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NavMenu />
    </div>
  );
}
