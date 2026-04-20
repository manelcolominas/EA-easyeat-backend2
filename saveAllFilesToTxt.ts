import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(__dirname, 'src'); // carpeta arrel dels fitxers
const OUTPUT_FILE = path.join(__dirname, 'allCode.txt');

/**
 * Llegeix tots els fitxers recursivament dins d'una carpeta
 */
function getAllFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

/**
 * Guarda tot el codi en un fitxer txt
 */
function saveAllFilesToTxt() {
    const files = getAllFiles(SRC_DIR);

    const writeStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });

    files.forEach((filePath) => {
        // Només inclou fitxers de codi (typescript / ts) i opcionalment .json
        if (filePath.endsWith('.ts') || filePath.endsWith('.json')) {
            const relativePath = path.relative(__dirname, filePath);
            const content = fs.readFileSync(filePath, 'utf-8');

            writeStream.write(`\n\n==================== ${relativePath} ====================\n\n`);
            writeStream.write(content);
            writeStream.write('\n\n'); // espai extra entre fitxers
        }
    });

    writeStream.close();
    console.log(`Tot el codi s'ha guardat a ${OUTPUT_FILE}`);
}

// Executa
saveAllFilesToTxt();