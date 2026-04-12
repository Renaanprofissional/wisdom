import { MdExplore } from "react-icons/md";
import { FaFire, FaHome, FaUser } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import ButtonMenu from "./buttonMenu";

export function NavMenu() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-orange-500/10 flex justify-around items-center py-3 z-10">
      <ButtonMenu
        icon={<FaHome />}
        label="Home"
        active={pathname === "/"}
        onClick={() => router.push("/")}
      />
      <ButtonMenu
        icon={<MdExplore />}
        label="Contato"
        active={pathname === "/contato"}
        onClick={() => router.push("/contato")}
      />
      <ButtonMenu
        icon={<FaFire />}
        label="Ranking"
        active={pathname === "/ranking"}
        onClick={() => router.push("/ranking")}
      />
      <ButtonMenu
        icon={<FaUser />}
        label="Perfil"
        active={pathname === "/profile"}
        onClick={() => router.push("/profile")}
      />
    </nav>
  );
}
