const fs = require('fs');
const path = require('path');

// Define source and output folders
const srcFolder = path.join(__dirname, '');
const distFolder = path.join(__dirname, 'dist');
const outputFile = path.join(distFolder, 'index.html');

// Ensure the dist folder exists
if (!fs.existsSync(distFolder)) {
	fs.mkdirSync(distFolder);
}

// Read and combine HTML parts
const combineHTML = () => {
	try {
		// Load the main template file
		let template = fs.readFileSync(path.join(srcFolder, 'index.html'), 'utf-8');

		// Replace placeholders with partial HTML files
		template = template.replace(/@@include\(['"](.+?)['"]\)/g, (match, fileName) => {
			const filePath = path.join(srcFolder, fileName);
			if (fs.existsSync(filePath)) {
				return fs.readFileSync(filePath, 'utf-8');
			} else {
				console.error(`File not found: ${fileName}`);
				return '';
			}
		});

		// Write combined HTML to output
		fs.writeFileSync(outputFile, template, 'utf-8');
		console.log(`Combined HTML written to ${outputFile}`);
	} catch (err) {
		console.error('Error combining HTML:', err);
	}
};

const copyCSS = () => {
	fs.copyFile(path.join(srcFolder, 'styles.css'), path.join(distFolder, 'styles.css'), err => {
		if (err) {
			console.error('Error copying file:', err);
		} else {
			console.log('File copied successfully!');
		}
	});
};

// Run the combining function
combineHTML();
copyCSS();
