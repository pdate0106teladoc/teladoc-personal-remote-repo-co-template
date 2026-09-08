import { useEffect, useState } from "react";

export function CountdownToast({ name, url, closeToast }: any) {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count === 0) {
            closeToast();
            window.location.href = url;
            return;
        }

        const timer = setTimeout(() => setCount((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [count]);

    return (
        <div>
            <div>{name}</div>
            <div className="text-muted">Redirecting in {count} …</div>
        </div>
    );
}
