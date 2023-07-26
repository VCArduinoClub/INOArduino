import Link from "next/link";

const HomeLink  = ({path, title, description, children} : {path: string, title: string, description: string, children: any[]}) => {
    return (
        <>
                       
        <Link
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                href={"/lessons/".concat(path)}
                target="_blank"
        >
                <h3 className="text-2xl font-bold"> {title} →</h3>
                <div className="text-lg">
                    {description}
                </div>
            </Link>
        </>
    );
}

export default HomeLink;