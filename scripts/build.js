import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { TemplateTags } from './template-tags.enum.js';

const PROJECT_ROOT = url.fileURLToPath(new URL('../', import.meta.url));
const DIST_DIR = path.join(PROJECT_ROOT, 'docs');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'src');
const PARTIALS_DIR = path.join(SOURCE_DIR, 'partials');
const SVG_DIR = path.join(SOURCE_DIR, 'svg');

// Read and combine HTML parts
const combineHTML = () => {
	const PartialTag = TemplateTags.Partial.description;

	try {
		// Load the main template file
		let template = fs.readFileSync(path.join(SOURCE_DIR, 'index.html'), 'utf-8');
		const partialNameRegex = new RegExp(`${PartialTag}\\([\'"](.+?)[\'"]\\)`, 'g');

		while (template.includes(PartialTag)) {
			// Replace placeholders with partial HTML files
			template = template.replace(partialNameRegex, (match, fileName) => {
				const filePath = path.join(PARTIALS_DIR, `${fileName}.html`);
				if (fs.existsSync(filePath)) {
					return fs.readFileSync(filePath, 'utf-8');
				} else {
					console.error(`File not found: ${fileName}`);
					return '';
				}
			});
		}

		console.log(`Combined HTML`);
		return template;

		// Write combined HTML to output
	} catch (err) {
		console.error('Error combining HTML:', err);
	}
};

const replaceSvgTags = template => {
	const svgNameRegex = new RegExp(`${TemplateTags.Svg.description}\\([\'"](.+?)[\'"]\\)`, 'g');
	template = template.replace(/@@svg\(['"](.+?)['"]\)/g, (match, fileName) => {
		const filePath = path.join(SVG_DIR, `${fileName}.svg`);
		if (fs.existsSync(filePath)) {
			return fs.readFileSync(filePath, 'utf-8');
		} else {
			console.error(`File not found: ${fileName}`);
			return '';
		}
	});
	console.log(`Replaced all SVG tags`);
	return template;
};

const combineCSS = () => {
	try {
		const styles = ['base.css', 'header.css', 'footer.css', 'services.css', 'about.css', 'hire-me.css', 'timeline.css']
			.map(fileName => path.join(PARTIALS_DIR, fileName))
			.map(filePath => fs.readFileSync(filePath, 'utf-8'))
			.join('\n');

		fs.writeFileSync(path.join(DIST_DIR, 'styles.css'), styles, 'utf-8');
		console.log(`Combined CSS written to ${path.join(DIST_DIR, 'styles.css')}`);
	} catch (err) {
		console.error('Error combining CSS:', err);
	}
};

const copyFavicon = () => {
	const sourcePath = path.join(SVG_DIR, 'ng-k.svg');
	const destinationPath = path.join(DIST_DIR, 'favicon.svg');
	fs.copyFile(sourcePath, destinationPath, err => {
		if (err) {
			console.error('Error copying the file:', err);
		} else {
			console.log('SVG file copied successfully!');
		}
	});
};

// Ensure the dist folder exists
if (!fs.existsSync(DIST_DIR)) {
	fs.mkdirSync(DIST_DIR);
}

// Run the combining function
let template = combineHTML();
template = replaceSvgTags(template);
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), template, 'utf-8');
combineCSS();
copyFavicon();
