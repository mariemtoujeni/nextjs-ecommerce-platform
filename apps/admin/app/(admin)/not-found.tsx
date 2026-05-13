import Image from 'next/image';
import { NavBack } from '~/components/navback';

export default async function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-90px)] gap-8">
            <div className="relative h-[300px] w-full">
                <Image src="/404.svg" alt="404" fill />
            </div>
            <div className="text-xl"><span className="font-bold">Oops !</span> Il semblerait que la cette page n'existe pas...</div>
            <NavBack />
        </div>
    );
} 