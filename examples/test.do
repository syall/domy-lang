do test(hello) {
	my variable =
		(hello == true)
			? false
			: true;
	return variable;
}

my block = test(false);
