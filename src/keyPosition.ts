/**
 * キーボードの位置を返します
 * @param layout 対応するレイアウト。空白 ` ` 区切りの文字列の配列
 * @param key 入力。プロパティ `KeyboardEvent.key`
 * @return 位置を配列 `[x, y]` で返します。見つからない場合、空 `[]`
 */
function keyPosition(
  layout: readonly string[],
  key: string
): [number, number] | [] {
  const [x, y] = layout
    .map((row) => row.split(" ").indexOf(key))
    .flatMap((x, y) => (x >= 0 ? [x, y] : []));

  return x >= 0 ? [x, y] : [];
}

export default keyPosition;
