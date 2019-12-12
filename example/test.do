my stat = true;
my f1 = do(arg1, arg2) {
	stat = stat
		? (arg1 & stat)
		: arg2 | !stat;
	return(stat ? arg1 : arg2);
};

my f2 = do(arg1, arg2, arg3) {
	return(arg1(arg2, arg3));
};

my best = false;
while((best = !f2(f1, stat, best))) {
	stat && break();
	best && continue();
	!best && return();
} && print(best ^ stat);
