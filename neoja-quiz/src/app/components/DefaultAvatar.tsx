'use client';

interface DefaultAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function DefaultAvatar({ name, size = 40, className = '' }: DefaultAvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on the name
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = colors[colorIndex % colors.length];

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor} ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
} 