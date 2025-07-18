import Image from 'next/image';
import { Card, CardContent } from './card';
import Sidebarsheet from './sidebarsheet';


const Header = () => {
  return (
    <Card className="overflow-hidden border-2 border-[#9c6a1c]">
      <CardContent className="flex items-center justify-between p-5">
        <Image
          src="/charles1.png"
          alt="logo"
          width={60}
          height={60}
          className="rounded-full -ml-2 object-cover w-auto h-auto"
        />
        <Sidebarsheet />
      </CardContent>
    </Card>
  );
}

export default Header;