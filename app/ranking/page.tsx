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
      <div className="min-h-screen flex items-center justify-center bg-background text-brand animate-pulse">
        <FaRankingStar /> Carregando ranking...
      </div>
    );
  }

  const top3 = users.slice(0, 3);

  const rest = search
    ? filteredUsers
    : filteredUsers.filter((u) => !top3.some((t) => t.id === u.id));

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto mb-16">
        {/* HEADER */}
        <h1 className="text-4xl font-bold text-brand mb-6 flex items-center gap-2">
          <FaRankingStar /> Ranking Wisdom
        </h1>

        {/* SEARCH */}
        <input
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-10 p-3 rounded-xl bg-card border border-border focus:border-brand outline-none"
        />

        {/* TOP 3 */}
        {!search && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[top3[0], top3[1], top3[2]].map((player, i) =>
              player ? (
                <div
                  key={player.id}
                  className={`p-6 rounded-3xl text-center bg-card border ${
                    i === 0 ? "border-brand" : "border-border"
                  }`}
                >
                  <FaCrown
                    className={`mx-auto text-3xl mb-3 ${
                      i === 0 ? "text-brand" : "text-muted-foreground"
                    }`}
                  />

                  <img
                    src={player.image || "/wisdom.svg"}
                    className={`mx-auto rounded-full mb-3 ${
                      i === 0 ? "w-24 h-24 border-2 border-brand" : "w-20 h-20 border border-border"
                    }`}
                  />

                  <p className="font-bold text-lg flex items-center justify-center gap-2">
                    {player.name}
                    {player.isPro && (
                      <span className="text-xs px-2 py-0.5 bg-brand/15 text-brand rounded-full font-bold">
                        PRO
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    #{i + 1} Lugar
                  </p>

                  <div className="flex justify-center gap-4 mt-3 text-sm">
                    <span className="text-brand flex items-center gap-1">
                      <BsStars /> {player.xp}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FaFire /> {player.streak}
                    </span>
                  </div>
                </div>
              ) : null,
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
                className="p-4 rounded-xl flex items-center justify-between bg-card border border-border"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-brand/15 text-brand">
                    {position}
                  </div>

                  <img
                    src={user.image || "/wisdom.svg"}
                    className="w-10 h-10 rounded-full"
                  />

                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      {user.name}

                      {user.isPro && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-brand/15 text-brand rounded-full font-bold">
                          <FaCrown /> PRO
                        </span>
                      )}
                    </p>

                    <div className="w-full h-1.5 bg-muted mt-1 rounded overflow-hidden">
                      <div
                        className="h-full bg-brand"
                        style={{
                          width: `${Math.min(user.xp % 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="text-brand flex items-center gap-1">
                    <BsStars /> {user.xp}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
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
