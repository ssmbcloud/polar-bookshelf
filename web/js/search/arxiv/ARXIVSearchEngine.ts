import {search} from '../SearchEngine';
import {Optional} from '../../util/ts/Optional';

export class ARXIVSearchEngine implements search.Engine {

    public id: search.EngineIDStr = 'arxiv';

    private readonly query: search.QueryStr;

    constructor(query: search.QueryStr) {
        this.query = query;
    }

    public async executeQuery(): Promise<search.Results> {

        const url = `http://export.arxiv.org/api/query?search_query=${this.query}`;

        const response = await fetch(url);

        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/xml");

        const entryElements = doc.querySelectorAll('entry');

        const entries: search.Entry[] = [];

        for (const entryElement of Array.from(entryElements)) {

            const entry = this.toEntry(entryElement);
            entries.push(entry);

        }

        const page: search.Page = {entries};

        return new search.SinglePageResults(page);

    }

    private toEntry(entryElement: Element): search.Entry {

        // title, summary, published, updated, id
        //
        // <entry>
        //     <id>http://arxiv.org/abs/cond-mat/0102536v1</id>
        //     <updated>2001-02-28T20:12:09Z</updated>
        //     <published>2001-02-28T20:12:09Z</published>
        //     <title>Impact of Electron-Electron Cusp on Configuration Interaction Energies</title>
        //     <summary>  The effect of the electron-electron cusp on the convergence of configuration
        // interaction (CI) wave functions is examined. By analogy with the
        // pseudopotential approach for electron-ion interactions, an effective
        // electron-electron interaction is developed which closely reproduces the
        // scattering of the Coulomb interaction but is smooth and finite at zero
        // electron-electron separation. The exact many-electron wave function for this
        // smooth effective interaction has no cusp at zero electron-electron separation.
        // We perform CI and quantum Monte Carlo calculations for He and Be atoms, both
        // with the Coulomb electron-electron interaction and with the smooth effective
        // electron-electron interaction. We find that convergence of the CI expansion of
        // the wave function for the smooth electron-electron interaction is not
        // significantly improved compared with that for the divergent Coulomb interaction
        // for energy differences on the order of 1 mHartree. This shows that, contrary to
        // popular belief, description of the electron-electron cusp is not a limiting
        // factor, to within chemical accuracy, for CI calculations.
        // </summary>
        //     <author>
        //       <name>David Prendergast</name>
        //       <arxiv:affiliation xmlns:arxiv="http://arxiv.org/schemas/atom">Department of Physics</arxiv:affiliation>
        //     </author>
        //     <author>
        //       <name>M. Nolan</name>
        //       <arxiv:affiliation xmlns:arxiv="http://arxiv.org/schemas/atom">NMRC, University College, Cork, Ireland</arxiv:affiliation>
        //     </author>
        //     <author>
        //       <name>Claudia Filippi</name>
        //       <arxiv:affiliation xmlns:arxiv="http://arxiv.org/schemas/atom">Department of Physics</arxiv:affiliation>
        //     </author>
        //     <author>
        //       <name>Stephen Fahy</name>
        //       <arxiv:affiliation xmlns:arxiv="http://arxiv.org/schemas/atom">Department of Physics</arxiv:affiliation>
        //     </author>
        //     <author>
        //       <name>J. C. Greer</name>
        //       <arxiv:affiliation xmlns:arxiv="http://arxiv.org/schemas/atom">NMRC, University College, Cork, Ireland</arxiv:affiliation>
        //     </author>
        //     <arxiv:doi xmlns:arxiv="http://arxiv.org/schemas/atom">10.1063/1.1383585</arxiv:doi>
        //     <link title="doi" href="http://dx.doi.org/10.1063/1.1383585" rel="related"/>
        //     <arxiv:comment xmlns:arxiv="http://arxiv.org/schemas/atom">11 pages, 6 figures, 3 tables, LaTeX209, submitted to The Journal of
        //   Chemical Physics</arxiv:comment>
        //     <arxiv:journal_ref xmlns:arxiv="http://arxiv.org/schemas/atom">J. Chem. Phys. 115, 1626 (2001)</arxiv:journal_ref>
        //     <link href="http://arxiv.org/abs/cond-mat/0102536v1" rel="alternate" type="text/html"/>
        //     <link title="pdf" href="http://arxiv.org/pdf/cond-mat/0102536v1" rel="related" type="application/pdf"/>
        //     <arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="cond-mat.str-el" scheme="http://arxiv.org/schemas/atom"/>
        //     <category term="cond-mat.str-el" scheme="http://arxiv.org/schemas/atom"/>
        //   </entry>

        const toText = (query: string): string | undefined => {

            const childElement = entryElement.querySelector(query);

            return Optional.of(childElement)
                .map(current => current.textContent)
                .getOrUndefined();

        };

        const toContentStr = (type: search.ContentStrType, value?: string): search.ContentStr | undefined => {

            if (value) {
                return {value, type};
            }

            return undefined;

        };

        const toLinks = () => {

            const links: search.DocLink[] = [];

            const linkElements = Array.from(entryElement.querySelectorAll('link'));

            for (const linkElement of linkElements) {

                const href = linkElement.getAttribute("href");
                const type = linkElement.getAttribute("type");

                if (href && type) {

                    if (type === 'application/pdf') {
                        links.push({
                            href, type, disposition: 'download'
                        });
                    }

                    if (type === 'text/html') {
                        links.push({
                            href, type, disposition: 'landing'
                        });
                    }

                }

            }

            return links;

        };

        // TODO: arxiv:doi to include the DOI.

        const id = toText('id')!;
        const title = toText('title');
        const updated = toText('updated');
        const published = toText('published')!;
        const summary = toContentStr('text', toText('summary'));
        const links = toLinks();

        return {
            id,
            title,
            summary,
            updated,
            published,
            links
        };

    }

}
