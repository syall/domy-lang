my stat = true;
# 1 print(stat);
stat = stat;
# 2 print(stat);
stat = (stat);
# 3 print(stat);
stat = do(arg1, arg2) {}
stat(true, true);
# 4 print(stat);
stat = !stat;
# 5 print(stat);
stat = stat ^ false;
# 6 print(stat);
stat = stat & true;
# 7 print(stat);
stat = stat | false;
# 8 print(stat);
stat = (stat) ? true : false;
# 9 print(stat);
stat = !stat;
# 10 print(stat);
stat = stat;
# 11 print(stat);
stat = stat == true;
# 12 print(stat);
stat = stat != false;
# 13 print(stat);
stat = false;
# 14 print(stat);
stat = (stat & true) | false;
# 15 print(stat);
stat = do(arg1, arg2) {
    return arg1 & arg2;
}
stat(true, true);
# 16 print(stat(true, true));
stat = while stat = !stat {
    !stat & continue;
    stat & break;
}
print(stat);
