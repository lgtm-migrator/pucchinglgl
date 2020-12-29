/** キーボード配列。プロパティ `KeyboardEvent.key` 相当の空白 ` ` 区切りの文字列の配列 */
const keyLayouts = {
  default: [
    `\` 1 2 3 4 5 6 7 8 9 0 - = Backspace`,
    `Tab q w e r t y u i o p [ ] \\`,
    `CapsLock a s d f g h j k l ; ' Enter`,
    `Shift z x c v b n m , . /`,
  ],
  shift: [
    `~ ! @ # $ % ^ & * ( ) _ + Backspace`,
    `Tab Q W E R T Y U I O P { } |`,
    `CapsLock A S D F G H J K L : " Enter`,
    `Shift Z X C V B N M < > ?`,
  ],
} as const;

export default keyLayouts;
