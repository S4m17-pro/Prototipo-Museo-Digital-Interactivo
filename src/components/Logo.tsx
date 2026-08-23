type LogoProps = {
  size?: "sm" | "lg";
};

export default function Logo({ size = "sm" }: LogoProps) {
  return (
    <img
      src="/logo-unilibre-escudo.svg"
      alt="Escudo Universidad Libre"
      className={`block w-auto flex-shrink-0 ${
        size === "lg" ? "h-[58px]" : "h-[38px]"
      }`}
      draggable={false}
    />
  );
}
