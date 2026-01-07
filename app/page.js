import HeroSlider from "./components/HeroSlider";
import ShopByCollection from "./components/ShopByCollection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28">
      <HeroSlider />
      <ShopByCollection />
    </main>
  );
}
