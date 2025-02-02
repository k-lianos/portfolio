import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and output folders
const partialsFolder = path.join(__dirname, 'partials');
const svgFolder = path.join(__dirname, 'svg');
const distFolder = path.join(__dirname, 'docs');

// Ensure the dist folder exists
if (!fs.existsSync(distFolder)) {
	fs.mkdirSync(distFolder);
}

// Read and combine HTML parts
const combineHTML = () => {
	try {
		// Load the main template file
		let template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

		while (template.includes('@@include')) {
			// Replace placeholders with partial HTML files
			template = template.replace(/@@include\(['"](.+?)['"]\)/g, (match, fileName) => {
				const filePath = path.join(partialsFolder, fileName);
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
	template = template.replace(/@@svg\(['"](.+?)['"]\)/g, (match, fileName) => {
		const filePath = path.join(svgFolder, `${fileName}.svg`);
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
			.map(fileName => path.join(partialsFolder, fileName))
			.map(filePath => fs.readFileSync(filePath, 'utf-8'))
			.join('\n');

		fs.writeFileSync(path.join(distFolder, 'styles.css'), styles, 'utf-8');
		console.log(`Combined CSS written to ${path.join(distFolder, 'styles.css')}`);
	} catch (err) {
		console.error('Error combining CSS:', err);
	}
};

// Run the combining function
let template = combineHTML();
template = replaceSvgTags(template);
fs.writeFileSync(path.join(distFolder, 'index.html'), template, 'utf-8');
combineCSS();
