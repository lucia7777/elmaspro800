let Quotes = `Yo los amaba, amaba a mis padres y a mis hermanos. Pero era egoísta, Harry, más egoísta de lo que tú, que eres una persona asombrosamente desinteresada, podrías imaginar.
¡Todo el dinero y la vida que uno pueda desear! Las dos cosas que la mayor parte de los seres humanos elegirían... El problema es que los humanos tienen el don de elegir precisamente las cosas que son peores para ellos.
Soñé contigo. Soñé que vagabas en la oscuridad, y yo también. Nos encontramos el uno al otro. Nos encontramos en la oscuridad.
Nunca sabemos en qué vidas influimos, ni cuándo ni por qué. No hasta que el futuro se coma el presente, de todos modos. Sabemos cuando es demasiado tarde.
No hay buenos amigos, no hay malos amigos; Solo las personas con las que quieres estar o necesitas estar. Personas que construyen sus casas en tu corazón.
La disciplina y el trabajo constante son las piedras de sobre las que se afila el cuchillo del talento hasta que se vuelve lo suficientemente afilado, con suerte, para cortar incluso la carne más dura.
El sueño podría haber sido más que un sueño. Era como si una puerta en la pared de la realidad se hubiera entreabierto... y ahora todo tipo de cosas no deseadas volaban a través de ella.
Caemos de la matriz a la tumba, de una oscuridad y hacia la otra, recordando poco de uno y sin saber nada del otro... excepto a través de la fe.
Amor y deseo son dos cosas diferentes; que no todo lo que se ama se desea, ni todo lo que se desea se ama
Y cuando te hayas consolado, te alegrarás de haberme conocido
El hombre llega mucho más lejos para evitar lo que teme que para alcanzar lo que desea
¡Qué maravilloso es que nadie necesite esperar ni un solo momento antes de comenzar a mejorar el mundo!
No todo lo que es de oro reluce, ni toda la gente errante anda perdida
La alegría causa a veces un efecto extraño; oprime al corazón casi tanto como el dolor
A pesar de ti, de mí y del mundo que se desquebraja, yo te amo
Seas quien seas, hagas lo que hagas, cuando deseas con firmeza alguna cosa es porque este deseo nació en el alma del universo. Es tu misión en la tierra
El mundo era tan reciente que muchas cosas carecían de nombre, y para nombrarlas había que señalarlas con el dedo
Nada hay en el mundo, ni hombre ni diablo ni cosa alguna, que sea para mí tan sospechoso como el amor, pues este penetra en el alma más que cualquier otra cosa. Nada hay que ocupe y ate más al corazón que el amor...
Resulta extraño pensar que, cuando uno teme algo que va a ocurrir y quisiera que el tiempo empezara a pasar más despacio, el tiempo suele pasar más deprisa
Reflexionar serena, muy serenamente, es mejor que tomar decisiones desesperadas.
Crearía un perfume que no sólo fuera humano, sino sobrehumano. Un aroma de ángel, tan indescriptiblemente bueno y pletórico de vigor que quien lo oliera quedaría hechizado y no tendría más remedio que amar a la persona que lo llevara...
De pronto se deslizó por el pasillo, al pasar por mi lado sus sorprendentes pupilas de oro se detuvieron un instante en las mías. Debí morir un poco. No podía respirar y se me detuvo el pulso
Era el mejor de los tiempos, era el peor de los tiempos, era la edad de la sabiduría, era la edad de la insensatez, era la época de la creencia, era la época de la incredulidad, era la estación de la luz, era la estación de la oscuridad...`.split(
    '\n'
);

const { createCanvas, loadImage } = require('canvas');
const watch = require('timewatch');

module.exports.run = (client, message, args) => {
    message.channel.send('Empezando en 6...').then(msg => {
        var i = 6,
            min = 0;
        function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = ctx.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
        }
        function EmpezarJuego() {
            let quote = Quotes[Math.floor(Math.random() * Quotes.length)];

            const canvas = createCanvas(800, 444);
            const ctx = canvas.getContext('2d');

            ctx.font = '50px Impact';
            ctx.fillStyle = '#ffffff';
            //ctx.fillText(quote.match(/.{1,29}/g).join('-\n'), 50, 50);
            wrapText(ctx, quote, 50, 50, 750, 50);
            msg.edit(
                'Empezamos! Se mas rapido que los demas en escribir lo siguiente (1 min): '
            ).then(() => {
                message.channel
                    .send({ files: [canvas.toBuffer()] })
                    .then(() => {
                        let filter = message => message.content == quote;
                        let collector = message.channel.createMessageCollector(
                            filter,
                            { time: 600000 }
                        );
                        let doNotEnd = false;
                        watch.start();
                        collector.once('collect', m => {
                            doNotEnd = true;
                            watch.stop();
                            m.delete();
                            client.TypeRacerDB.sumar(m.author.id + '.wins', 1);
                            client.TypeRacerDB.push(
                                m.author.id + '.record',
                                watch.time() / 1000
                            );
                            message.channel.send(
                                `<@${m.author.id}> ha ganado! (tardo: ${
                                    watch.time() / 1000
                                }s)`
                            );
                            watch.reset();
                        });

                        collector.on('end', () => {
                            if (!doNotEnd) {
                                message.channel.send(
                                    `Nadie alcanzo a escribir la cita!`
                                );
                            }
                        });
                    });
            });
        }

        function Bucle() {
            i--;
            if (!(i < min)) {
                setTimeout(() => {
                    msg.edit(`Empezando en ${i}...`).then(() => {
                        Bucle();
                    });
                }, 1000);
            } else {
                EmpezarJuego();
            }
        }
        Bucle();
    });
};
