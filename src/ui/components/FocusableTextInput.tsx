import {useRef, useState} from 'react';
import {Pressable, StyleSheet, TextInput, type TextInputProps} from 'react-native';

import {colors, fontSize, radius, spacing} from '../theme';

interface Props extends TextInputProps {
  readonly hasTVPreferredFocus?: boolean;
}

/**
 * A TextInput that can be reached with a TV remote's D-pad.
 *
 * On Android TV, react-native-tvos does not place a bare TextInput in the
 * D-pad focus graph, so it can never receive focus from a remote (see
 * react-native-tvos issues #901 and #155). The documented workaround is to
 * wrap the input in a focusable touchable and focus it via a ref. The wrapper
 * Pressable is the focus target; focusing it opens the keyboard and hands
 * text focus to the inner input.
 */
export function FocusableTextInput({hasTVPreferredFocus = false, style, ...props}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const focusInput = () => inputRef.current?.focus();

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onBlur={() => setFocused(false)}
      onFocus={() => {
        setFocused(true);
        focusInput();
      }}
      onPress={focusInput}
      style={[styles.wrapper, focused && styles.wrapperFocused]}
    >
      <TextInput ref={inputRef} style={[styles.input, style]} {...props} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    maxWidth: 520,
  },
  wrapperFocused: {
    borderColor: colors.borderFocused,
  },
  input: {
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
});
