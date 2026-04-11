"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaFire, FaCrown } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { GiBatwingEmblem } from "react-icons/gi";

type UserRank = {
  id: string;
  name: string;
  image?: string;
  xp: number;
  level: number;
  streak: number;
};

export default function RankingPage() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch("/api/ranking");
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400 text-lg animate-pulse px-4 text-center">
        Carregando ranking...
      </div>
    );
  }

  const top3 = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050505] to-black text-white px-4 sm:px-6 py-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-orange-400 flex items-center gap-2">
            🔥 Ranking Global
          </h1>

          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm sm:text-base"
          >
            ⬅ Voltar
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 sm:mb-8 p-3 rounded-xl bg-[#111] border border-orange-500/20 focus:outline-none focus:border-orange-400 text-sm sm:text-base"
        />

        {/* TOP 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
          {top3.map((user, index) => {
            const avatar = user.image || "/wisdom.svg";

            const styles = [
              "sm:scale-105 bg-yellow-500/20 border-yellow-400",
              "bg-gray-400/10 border-gray-300",
              "bg-orange-500/10 border-orange-400",
            ];

            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border text-center ${styles[index]} shadow-lg`}
              >
                <div className="flex justify-center mb-2">
                  <FaCrown
                    className={`text-xl sm:text-2xl ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                          ? "text-gray-300"
                          : "text-orange-400"
                    }`}
                  />
                </div>

                <img
                  src={avatar}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 border-white/20"
                />

                <p className="font-bold text-sm sm:text-base">{user.name}</p>

                <p className="text-xs text-gray-400">Level {user.level}</p>

                <div className="mt-2 text-xs text-orange-400 flex justify-center gap-2">
                  <BsStars /> {user.xp}
                </div>
              </div>
            );
          })}
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {rest.map((user, index) => {
            const avatar = user.image || "/wisdom.svg";
            const position = index + 4;

            return (
              <div
                key={user.id}
                className="p-3 sm:p-4 rounded-xl border bg-[#111] border-orange-500/10 hover:border-orange-400/40 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {/* TOP (mobile) / LEFT (desktop) */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-orange-400 font-bold w-8 sm:w-10 text-center text-sm sm:text-base">
                    #{position}
                  </span>

                  <img
                    src={avatar}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-400">Level {user.level}</p>

                    {/* XP BAR */}
                    <div className="w-full sm:w-40 h-1 bg-black rounded mt-1 overflow-hidden">
                      <div
                        className="h-full bg-orange-400"
                        style={{ width: `${Math.min(user.xp % 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex justify-between sm:justify-end gap-4 sm:gap-5 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 text-orange-400">
                    <BsStars /> {user.xp}
                  </span>

                  <span className="flex items-center gap-1 text-red-400">
                    <FaFire /> {user.streak}
                  </span>

                  <span className="flex items-center gap-1 text-purple-400">
                    <GiBatwingEmblem /> {user.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
