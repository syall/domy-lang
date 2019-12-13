my stat = true;
my f1 = do(arg1, arg2) {
    stat = stat
        ? arg1 == stat
        : arg2 | !stat;
    return stat ? arg1 : arg2;
};
# Hello

my f2 = do(arg1, arg2, arg3) {
    return arg1(arg2, arg3);
};

my best = false;

!best &
while(best = !f2(f1, stat, best)) {
    stat & break;
    best & continue;
} & best
    ? print(best);
    : print(best ^ stat);
