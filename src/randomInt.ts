const { floor, random } = Math;

/** 範囲 [0, high] のランダムな整数を返します */
function randomInt(high: number) {
  return floor(random() * (high + 1));
}

export default randomInt;
