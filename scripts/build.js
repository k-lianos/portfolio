import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { TemplateTags } from './template-tags.enum.js';

const PROJECT_ROOT = url.fileURLToPath(new URL('../', import.meta.url));
const DIST_DIR = path.join(PROJECT_ROOT, 'docs');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'src');
const PARTIALS_DIR = path.join(SOURCE_DIR, 'partials');
const SVG_DIR = path.join(SOURCE_DIR, 'svg');

/**
 * Reads the content of a file synchronously.
 * Logs an error and returns an empty string if the file cannot be read.
 */
const getFileContent = (filePath, fileDescription = filePath) => {
	try {
		return fs.readFileSync(filePath, 'utf-8');
	} catch (error) {
		console.error(`Error reading file "${fileDescription}": ${error.message}`);
		return '';
	}
};

/**
 * Recursively replaces partial placeholders in the template with the actual HTML content.
 * Returns the content of a single HTML file.
 */
const combineHTML = template => {
	const partialTag = TemplateTags.Partial.description;
	// Regex to match something like: @@partial('filename')
	const partialRegex = new RegExp(`${partialTag}\\(['"](.+?)['"]\\)`, 'g');

	while (template.includes(partialTag)) {
		template = template.replace(partialRegex, (match, fileName) => {
			const filePath = path.join(PARTIALS_DIR, `${fileName}.html`);
			if (fs.existsSync(filePath)) {
				return getFileContent(filePath, fileName);
			} else {
				console.error(`Partial file not found: ${fileName} (${filePath})`);
				return '';
			}
		});
	}

	console.log('Combined HTML successfully.');
	return template;
};

/**
 * Replaces SVG tag placeholders in the template with the actual SVG content.
 */
const replaceSvgTags = template => {
	const svgTag = TemplateTags.Svg.description;
	// Regex to match something like: @@svg("filename")
	const svgRegex = new RegExp(`${svgTag}\\((['"])(.+?)\\1\\)`, 'g');

	template = template.replace(svgRegex, (match, quote, fileName) => {
		const filePath = path.join(SVG_DIR, `${fileName}.svg`);
		if (fs.existsSync(filePath)) {
			return getFileContent(filePath, fileName);
		} else {
			console.error(`SVG file not found: ${fileName} (${filePath})`);
			return '';
		}
	});

	console.log('Replaced all SVG tags successfully.');
	return template;
};

/**
 * Combines multiple CSS files into a single stylesheet.
 */
const combineCSS = () => {
	const cssFiles = ['base.css', 'header.css', 'footer.css', 'services.css', 'about.css', 'hire-me.css', 'timeline.css'];

	const combinedCSS = cssFiles
		.map(fileName => {
			const filePath = path.join(PARTIALS_DIR, fileName);
			if (fs.existsSync(filePath)) {
				return getFileContent(filePath, fileName);
			} else {
				console.error(`CSS file not found: ${fileName} (${filePath})`);
				return '';
			}
		})
		.join('\n');

	console.log('Combined CSS');
	return combinedCSS;
};

const replaceStyleTag = (template, styles) => {
	template = template.replace(new RegExp(TemplateTags.Style.description), () => `<style>${styles}</style>`);
	console.log('Injected CSS styles in template');
	return template;
};

/**
 * Copies the favicon SVG from the source to the destination directory.
 */
const copyFavicon = () => {
	const sourcePath = path.join(SVG_DIR, 'ng-k.svg');
	const destinationPath = path.join(DIST_DIR, 'favicon.svg');
	try {
		fs.copyFileSync(sourcePath, destinationPath);
		console.log('Favicon SVG copied successfully.');
	} catch (err) {
		console.error('Error copying favicon SVG:', err);
	}
};

const build = () => {
	copyFavicon(); // copy the favicon file in the distribution folder

	let template = getFileContent(path.join(SOURCE_DIR, 'index.html'), 'index.html');

	template = combineHTML(template);

	template = replaceSvgTags(template);

	const styles = combineCSS(); // combine CSS files in one large css file

	template = replaceStyleTag(template, styles);

	fs.writeFileSync(path.join(DIST_DIR, 'index.html'), template, 'utf-8'); // Write final HTML to distribution directory
};

// Ensure the dist folder exists
if (!fs.existsSync(DIST_DIR)) {
	fs.mkdirSync(DIST_DIR);
}

console.log('**** BUILD.start ****');
console.log('_____________________');
build();
console.log('_____________________');
console.log('****  BUILD.end  ****');
