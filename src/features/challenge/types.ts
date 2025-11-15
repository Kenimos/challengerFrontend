export type Activity = {
    id: string;
    name: string;
    description?: string;
    icon?: string | null;

    recurrenceType: 1 | 2;               // 1=DaysOfWeek, 2=EveryNDays
    daysOfWeekMask?: number | null;
    intervalWeeks?: number | null;
    scheduleAnchorDate: string;          // "yyyy-MM-dd"
    everyNDays?: number | null;
};

export type ChallengeDetail = {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    ownerId: string;
    members?: { userId: string; userName: string }[];
};
