my stat = true;
my f1 = do(arg1, arg2) {
	stat = stat
		? (arg1 & stat)
		: arg2 | !stat;
	return stat ? arg1 : arg2;
}

do f2(arg1, arg2, arg3) {
	return arg1(arg2, arg3);
}

my best = false;
while(!best) {
	best = !f2(f1, stat, best);
}

print(best ^ stat);
