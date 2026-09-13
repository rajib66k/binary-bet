import { RedeemPanel } from "../../components/ui/RedeemPanel";
import { TradePanel } from "../../components/ui/TradePanel";

type TradePageProps = {
    searchParams: Promise<{
        market?: string;
        question?: string;
        outcome?: string;
    }>;
};

export default async function TradePage({ searchParams }: TradePageProps) {
    const params = await searchParams;
    const outcome = params.outcome === "no" ? "no" : "yes";

    return (
        <main className="mx-[5vw] mt-8">
            <div className="flex flex-col md:flex-row gap-8 justify-center">
                <TradePanel market={params.market ?? "Selected market"} question={params.question ?? "Market question"} outcome={outcome} />
                <RedeemPanel market={params.market ?? "Selected market"} question={params.question ?? "Market question"}/>
            </div>
        </main>
    );
}
