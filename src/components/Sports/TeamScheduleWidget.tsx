import { FC, useEffect, useState } from "react";
import { getTeamSchedule } from "../../services/sportmonksAPI";

interface TeamScheduleWidgetProps {
    teamId?: string;
}

const TeamScheduleWidget: FC<TeamScheduleWidgetProps> = ({ teamId = "3468" }) => {
    const [fixtures, setFixtures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            const data = await getTeamSchedule(teamId);
            setFixtures(data.slice(0, 5)); // Show next 5 matches
            setLoading(false);
        };
        fetchSchedule();
    }, [teamId]);

    if (loading) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 italic">Upcoming <span className="text-primary italic">Matches</span></h3>

            <div className="space-y-4">
                {fixtures.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex-1 flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(f.starting_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="flex flex-col gap-1 flex-1">
                                <p className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">{f.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{f.league?.name || "League Match"}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest p-2 rounded-xl bg-primary/10">
                                {new Date(f.starting_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Powered by Sportmonks Elite Data</p>
            </div>
        </div>
    );
};

export default TeamScheduleWidget;
