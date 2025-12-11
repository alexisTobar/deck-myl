const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Card = require('./models/Card');
require('dotenv').config();

// TUS EDICIONES
const EDICIONES = {
    "kvsm_titanes": 162,
    "libertadores": 161,
    "onyria": 160,
    "toolkit_cenizas_de_fuego": 156,
    "toolkit_hielo_inmortal": 155,
    "lootbox_2024": 150,
    "secretos_arcanos": 149,
    "bestiarium": 148,
    "escuadronmecha": 137,
    "amenazakaiju": 136,
    "zodiaco": 126,
    "espiritu_samurai": 125
    // Agregué las otras que tenías antes por si acaso

};

const importData = async () => {
    try {
        // 1. OBTENER Y LIMPIAR LA URL DEL .ENV
        let dbUri = process.env.MONGO_URI;
        if (dbUri) {
            // Limpieza de seguridad por si hay espacios o comillas
            dbUri = dbUri.trim().replace(/^["']+|["']+$/g, '');
        } else {
            dbUri = 'mongodb://localhost:27017/deckmylDB';
        }

        console.log("---------------------------------------------------");
        console.log("Conectando a base de datos...");
        console.log("---------------------------------------------------");

        // 2. CONECTAR
        await mongoose.connect(dbUri);
        console.log('🟢 Conectado a MongoDB Atlas exitosamente');

        // 3. BORRAR COLECCIÓN COMPLETA (Crucial para eliminar el error de índice duplicado)
        console.log('🧹 Borrando colección e índices antiguos...');
        try {
            await Card.collection.drop();
            console.log('✨ Colección borrada. Reglas limpias.');
        } catch (error) {
            console.log('✨ La colección estaba vacía o no existía, continuamos.');
        }

        // 4. RECORRER EDICIONES
        const edicionesArray = Object.keys(EDICIONES);

        for (const edicionSlug of edicionesArray) {
            console.log(`⬇️  Descargando edición: ${edicionSlug}...`);

            try {
                const res = await fetch(`https://api.myl.cl/cards/edition/${edicionSlug}`);

                if (!res.ok) {
                    console.log(`⚠️ Error al descargar ${edicionSlug}: ${res.statusText}`);
                    continue;
                }

                const data = await res.json();
                const cartasAPI = data.cards || [];

                if (cartasAPI.length === 0) {
                    console.log(`⚠️ La edición ${edicionSlug} parece vacía.`);
                    continue;
                }

                const cartasParaGuardar = cartasAPI.map(c => ({
                    slug: c.slug,
                    name: c.name,
                    edition_slug: edicionSlug,
                    ed_edid: c.ed_edid,
                    edid: c.edid,
                    imgUrl: c.ed_edid && c.edid
                        ? `https://api.myl.cl/static/cards/${c.ed_edid}/${c.edid}.png`
                        : "https://via.placeholder.com/200x280",
                    type: c.type || "Desconocido",
                    rarity: c.rarity || "Común"
                }));

                if (cartasParaGuardar.length > 0) {
                    // Usamos insertMany con ordered: false para que si una falla, las demás sigan
                    await Card.insertMany(cartasParaGuardar, { ordered: false });
                    console.log(`✅ ${cartasParaGuardar.length} cartas guardadas de ${edicionSlug}`);
                }

            } catch (errEdicion) {
                // Si sigue habiendo duplicados raros, esto evitará que se detenga todo el proceso
                if (errEdicion.code === 11000) {
                    console.log(`⚠️ Alerta: Algunas cartas duplicadas en ${edicionSlug} fueron omitidas.`);
                } else {
                    console.error(`❌ Error procesando edición ${edicionSlug}:`, errEdicion.message);
                }
            }
        }

        console.log('🎉 ¡IMPORTACIÓN COMPLETA! Todas las cartas están en tu BD.');
        process.exit();

    } catch (error) {
        console.error('🔴 Error fatal:', error);
        process.exit(1);
    }
};

importData();