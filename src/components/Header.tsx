import { useEffect, useRef, useState } from 'react';

const items = ['about', 'skills', 'projects', 'contact'];

export function Header() {
    const [open, setOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const navigation = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        navigation.current?.querySelector<HTMLAnchorElement>('a')?.focus();
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
        };
        const closeOnDesktop = () => { if (window.innerWidth > 850) setOpen(false); };
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', closeOnDesktop);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', closeOnDesktop);
        };
    }, [open]);

    return <header className="site-header">
        <a className="logo" href="#home">TAOSHIFLEX</a>
        <button ref={menuButton} className="menu" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(value => !value)}><span className="sr-only">Toggle navigation</span><span aria-hidden="true">Menu</span></button>
        {open && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
        <nav ref={navigation} id="navigation" className={open ? 'open' : ''} aria-label="Main navigation">{items.map(item => <a key={item} href={'#' + item} onClick={() => setOpen(false)}>{item}</a>)}</nav>
    </header>;
}
