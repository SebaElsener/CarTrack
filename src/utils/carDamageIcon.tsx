import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export default function CarDamageIcon({ size = 24, color = "#000" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 360">
      <Path
        fill={color}
        d="M0 112.50 l0 -112.50 112.50 0 112.50 0 0 112.50 0 112.50 -112.50 0 -112.50 0 0 -112.50z"
      />
    </Svg>
  );
}