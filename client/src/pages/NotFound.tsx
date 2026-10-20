import { Link } from 'react-router';
import { LogoMark } from '../components/SunMark';

export default function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <section className="grid min-h-[80vh] place-items-center bg-deep px-5 pt-28 text-center text-puti">
      <div>
        <LogoMark className="mx-auto w-24" />
        <p className="eyebrow mt-8 text-dahon">Naligaw ka, you're lost</p>
        <h1 className="mt-4 text-5xl font-extrabold md:text-7xl">Off the map.</h1>
        <p className="lead mx-auto mt-4 max-w-md text-puti/70">We couldn't find that {what}. Turn around at the next wide spot and head back to the trailhead.</p>
        <Link to="/" className="btn-primary mt-8">
          Back to base
        </Link>
      </div>
    </section>
  );
}
