import Banner from "../components/ui/Banner";
import { MarketGrid } from "../components/ui/MarketGrid";

export default function Home() {
  return (
    <div>
      <hr className="border border-[rgba(238,243,241,1)]" />
      <main className="sm:mx-20 mx-[5vw] md:mt-7 mt-[3vh]">
        <Banner />
        <hr className='mx-15 my-8 border-2 border-[rgba(238,243,241,1)]' />
        <MarketGrid />
      </main>
    </div>
  );
}
