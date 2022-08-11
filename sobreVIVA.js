// Game por Mikhael Osinski :) ///

let bancoItens = new Array();
let diasSobrevividos = 0;

let horasAcordado = 0;
let horaAtual = 6; //0 - 24.   6-18 - Sol.    19 - 05 - Lua

let inventorio = new Array();
let inventorioComida = new Array();
let inventorioMateriais = new Array();

let listaCraft = new Array();

let ItensDisponiveis;
let distanciaSelecionada;
let fomeAtual = 0;

let telaAtual;

const botaoDescansar = document.querySelector("#Descansar");
const botaoPassarHoras = document.querySelector("#passarTempo");
const botaoExplorar = document.querySelector("#Explorar");

let listaLoot = [];
const containerListaLoot = document.querySelector("#listaLoot");
const botaoLevarLoot = document.querySelector("#levarLoot");
let botoesChecadosLoot = 0;

const statusPersonagem = document.querySelector("#statusPersonagem>h2");

const botaoFogo = document.querySelector("#fogo");
let tempoFogo = 0;

const inventorioTela = document.querySelector("#inventorio");
const inventorioCozinha = document.querySelector("#Cozinha>#inventorio>div");
const inventorioOficina = document.querySelector("#Oficina>#inventorio>div");

const logTela = document.querySelector("#log");
let logAtual;

const craftOficina = document.querySelector("#Oficina>#menuCraft>div");
const craftCozinha = document.querySelector("#Cozinha>#menuCraft>div");

const botoesDistancia = document.getElementsByName('distancia');
const labelDistancia = document.querySelectorAll('.distanciaExplorar>label');

const root = document.querySelector(':root');





//console.log(VerificarItensInventorio(verificar = ['madeira','agua', 'cogumelos','frutas','graveto']));

class Item
{
    ID;
    nome;
    requisitosCraft;
    requisitoFerramenta; // Para obter este item é necessário uma FerramentaArma com a mesma utilidadeFerramenta
    
    
    constructor(cID,cNome, cRequisitosCraft,cRequisitoFerramenta)
    {
        this.ID = cID;
        this.nome = cNome;
        this.requisitosCraft = cRequisitosCraft;
        this.requisitoFerramenta = cRequisitoFerramenta;
        
    }
}



class Comida extends Item
{
    
    fomeSaciada; //Quantidade de horas sem comer

    constructor(cID, cNome, cFomeSaciada, cRequisitosCraft,cRequisitoFerramenta)
    {
        super(cID, cNome, cRequisitosCraft,cRequisitoFerramenta);
        this.fomeSaciada = cFomeSaciada;
    }
 
}



class ferramentaArma extends Item
{
    utilidadeFerramenta; //A definir
    poderArma; //Poder para rolar acontecimentos
    durabilidade;

    constructor(cID, cNome, cUtilidade, cPoder, cDurabilidade, cRequisitosCraft)
    {
        super(cID, cNome,cRequisitosCraft);
        this.utilidadeFerramenta = cUtilidade;
        this.poderArma = cPoder;
        this.durabilidade = cDurabilidade;
    }
    
}

class Lenha extends Item
{
    valorFogo;

    constructor(cID,cNome,cValorFogo)
    {
        super(cID,cNome,undefined,'madeira')
        {
            this.valorFogo = cValorFogo;
        }
    }
}

function Load()
{
    CorFundo();
    InitDB();
    atualizarStatusPersonagem();
    esconderBotoesAoLoot(false);
    telaAtual = '#telaCentral';

    
}




function Log(mensagem)
{
    if(logTela.childElementCount >= 2)
    {
        LimparLog();
    }

    var tag = document.createElement("spam");    
    tag.innerHTML = mensagem + "<br>" ;
    logTela.appendChild(tag);
}

function LimparLog()
{
    logTela.removeChild(logTela.firstChild);
}



function cliqueInventorio(valor)
{
    if(inventorio[valor] instanceof Comida)
    {
        Comer(inventorio[valor]);
    }

    if(inventorio[valor] instanceof Lenha)
    {
        ascenderFogo(inventorio[valor].valorFogo, inventorio[valor].ID);
    }
    
    
}

function tempoFome(valor)
{
    //a fome será calculada em horas sem comer. Os alimentos reduzem x número de horas.
    // + para aumentar a fome e - para reduzir

    fomeAtual += parseInt(valor);


        return true; 

}

function cliqueCraft(id)
{
    Craftar(id);
    //console.log("Clicou para craftar o item de ID: " + id);
}

function desenharCraft()
{
    
    for(x=0; x<bancoItens.length;x++)
    {
        if(bancoItens[x].requisitosCraft != undefined)
        {

                    //texto do botão
                    let texto = bancoItens[x].nome + " - Requisitos: ";

                    for(y=0; y< bancoItens[x].requisitosCraft.length; y++)
                    {
                        let itemRequisito = encontrarPorID(bancoItens[x].requisitosCraft[y]);

                            if(y == bancoItens[x].requisitosCraft.length-1)
                            {texto = texto + (bancoItens[itemRequisito].nome) + ".";}
                            else
                            {
                                texto = texto + (bancoItens[itemRequisito].nome) + ", ";
                            }
                            
                    }
            

            if(bancoItens[x] instanceof Comida)
            {
                var tag = document.createElement("button");
                tag.setAttribute('onclick','cliqueCraft('+bancoItens[x].ID+')');
                texto = texto + " Sacia: " + bancoItens[x].fomeSaciada; 
                tag.innerHTML = texto;
                craftCozinha.appendChild(tag);
            }
            else
            {
                var tag = document.createElement("button");
                tag.setAttribute('onclick','cliqueCraft('+bancoItens[x].ID+')'); 
                texto = texto + textoCraft(bancoItens[x].utilidadeFerramenta);
                tag.innerHTML = texto;
                craftOficina.appendChild(tag);
            }
            
        }
    }


}

function textoCraft(ferramentaNecessaria)
{
    switch(ferramentaNecessaria)
    {        
        case('madeira'): return(' - Permite conseguir lenhas para ascender o fogo');
        case('bolsa'):return(' - Permite retornar com mais frutas, legumes e temperos');
        case('caça'):return(' - Permite caçar Lebres e Raposas');
        case('caça1'):return(' - Permite caçar Javalis e Lobos');
        case('caça2'):return(' - Permite caçar Javalis, Lobos e Ursos');

        default:return('');
    }
}

function Explorar(distancia)
{
    //0 - mais próximo, 3 - mais distante
    tempoExplorar = calcTempoExplorar(distancia);

    Log("Você leva " + tempoExplorar + " horas para explorar o entorno");
    
    if(adicionarHorasAcordado(tempoExplorar)) {return;}
    
    CalcularRecompensaExplorar(distancia);
}

function calcTempoExplorar(distancia)
{
    let tempo;
    tempo = parseInt((distancia + 1)*3);
    return(tempo);
}



function adicionarInventorio(itens, desenhar)
{          
        

         if (Array.isArray(itens))
         {        
             listaObjetosItens = new Array();
             for(x=0; x<itens.length; x++)
             {
                
                listaObjetosItens.push(instanciarObjetosItens(itens[x]));
             }    
             Array.prototype.push.apply(inventorio,listaObjetosItens);  
         }
         //ou input de único objeto
         else
         {                  
             inventorio.push(instanciarObjetosItens(itens));
         }
    

    //para evitar ciclos de redesenho desncessários
    if (desenhar == true) { DesenharInventorio();}

}



function DesenharInventorio()
{
    //apagar todo o inventório
    while (inventorioCozinha.firstChild) {
        inventorioCozinha.removeChild(inventorioCozinha.firstChild);        
    }

    while (inventorioOficina.firstChild) {
        inventorioOficina.removeChild(inventorioOficina.firstChild);        
    }

    //redesenhar

    for(var x=0; x<inventorio.length;x++)
    {        
        var tag = document.createElement("button");
        tag.setAttribute('onclick','cliqueInventorio('+x+')');
        
       // var item = document.createTextNode(inventorio[x].nome); 
        tag.innerHTML = inventorio[x].nome;

            //enviar para a lista correta
            if(inventorio[x] instanceof Comida)
            {    
            tag.innerHTML =  tag.innerHTML + ", Sacia: " + inventorio[x].fomeSaciada;           
            inventorioCozinha.appendChild(tag);
            }
            else if (inventorio[x] instanceof Lenha)
            {
                tag.innerHTML =  tag.innerHTML + ", Alimenta o fogo por " + inventorio[x].valorFogo + " horas.";
                inventorioCozinha.appendChild(tag);
            }
            else if(inventorio[x] instanceof ferramentaArma)            
            {
            tag.innerHTML = tag.innerHTML + ", Durabilidade: " + inventorio[x].durabilidade;
            inventorioOficina.appendChild(tag);
            }  
            else if(inventorio[x] instanceof Item)            
            {
                inventorioOficina.appendChild(tag);
            }    
    }   

}



function adicionarHorasAcordado (horasAdicionais)
{   

    horasAcordado += horasAdicionais;

    if((fomeAtual + horasAdicionais) >= 100) 
    {
        GameOver();
        return true;
    }


    esconderRadio();
    //Log("Você está a " + horasAcordado + " horas acordado.");   
    atualizarHora(horasAdicionais);   
    atualizarStatusPersonagem() 
    //console.log("hora atual: " + horaAtual);
    return false; //não houve GameOver
}

function atualizarHora(horaPassada)
{
    horaPassada = parseInt(horaPassada);
    horaAtual += horaPassada;

    atualizarFogo(horaPassada);    
    
    
    if (!tempoFome(horaPassada)) {return;}
    

    if (horaAtual>=24)
    {
        horaAtual = horaAtual - 24;
        diasSobrevividos++;
    }
    CorFundo();
    //console.log("Agora são " + horaAtual + " horas");
}

function Descansar ()
{  

    if (horasAcordado<10)
    {
        Log("Você não está se sentindo cansado agora...");
        return;
    }

    //o número de horas dormidas é igual a 50% das horas acordado

    horasDormidas = (horasAcordado/2).toFixed();
    
    Log("Você dorme por " + horasDormidas + " horas e sente-se renovado");

    //o tempo fome é dividido por 3 ao passar tempo dormindo
    atualizarHora((horasDormidas/3).toFixed());
    horasAcordado = 0;
    atualizarStatusPersonagem()
    esconderRadio();
    
}


function ascenderFogo(valorFogo, IDLenha)
{
    
        //numero de balanceamento.
        tempoFogo = parseInt(tempoFogo) + valorFogo;
        Log("Você ascendeu uma brasa que durará por " + tempoFogo + ' horas');
        RemoverItem(IDLenha,true);
        botaoFogo.innerHTML = "A brasa está acesa, durará por cerca de " + tempoFogo + " horas.";
        
}

function atualizarFogo(tempo)
{
    if(tempoFogo>tempo)
    {
        tempoFogo -= tempo;
        botaoFogo.innerHTML = "A brasa está acesa, durará por cerca de " + tempoFogo + " horas.";
    }
    else
    {
        tempoFogo=0;
        botaoFogo.innerHTML = "O fogo está apagado.";
    }    

}




botaoDescansar.addEventListener("click", Descansar);

botaoLevarLoot.addEventListener("click", levarLoot);


botaoExplorar.addEventListener("click", () =>
{
    //pegar a distancia selecionada nos radio buttons
    let selecionouBotao = false;
    for(x = 0; x<botoesDistancia.length;x++)
    {
        if(botoesDistancia[x].checked)
        {
            selecionouBotao =true;
            distanciaSelecionada = parseInt(botoesDistancia[x].value);  
            botoesDistancia[x].checked = false;          
            Explorar(distanciaSelecionada);
        }
        
    }

    if(!selecionouBotao)
    {Log("Selecione a distância para explorar");}
   
}
);



function esconderRadio()
{
    //esconder os radio buttons baseado no cansaço

    for (x = 0; x<labelDistancia.length;x++)
    {
        //esse 35 pode ser colocado em uma variável, é um valor de balanceamento.
        if (calcTempoExplorar(parseInt(botoesDistancia[x].value)) + horasAcordado >= 35)
        {
            labelDistancia[x].style.display = 'none';
        }
        else {labelDistancia[x].style.display = 'inline-block';}
    }


    if(horasAcordado>=33)
    {
    document.querySelector('.distanciaExplorar>div').textContent = 'Cansado demais para explorar, descanse na Cabana';
    }
    else
    {
        document.querySelector('.distanciaExplorar>div').textContent = 'Do mais próximo ao mais distante - O cansaço diminui o quão longe você pode explorar';
    }
    

}



function Craftar(id)
{
    let itemCraftar = bancoItens[encontrarPorID(id)];

        if(itemCraftar instanceof Comida && tempoFogo == 0)
        {
            Log("É necessário que o fogo esteja aceso para cozinhar");
            return;
        }

        if(RemoverItem(itemCraftar.requisitosCraft) != false) 
        {
            adicionarInventorio(id,true);
            Log("Você fez: " + itemCraftar.nome);
        
        }
        else
        {Log("Você não possui tudo que é necessário para fazer isso.");}
}




function instanciarObjetosItens(id)
{
    itemInd = bancoItens.map(item => item.ID).indexOf(id);

    if(bancoItens[itemInd] instanceof Comida)
    {            
        let tempItem = new Comida(bancoItens[itemInd].ID, bancoItens[itemInd].nome, bancoItens[itemInd].fomeSaciada);
        return(tempItem);
    }
    else if (bancoItens[itemInd] instanceof ferramentaArma)
    {
        let tempItem = new ferramentaArma(bancoItens[itemInd].ID, bancoItens[itemInd].nome, bancoItens[itemInd].utilidadeFerramenta,bancoItens[itemInd].poderArma,bancoItens[itemInd].durabilidade,bancoItens[itemInd].requisitosCraft);
        return(tempItem);
    }
    if(bancoItens[itemInd] instanceof Lenha)
    {            
        let tempItem = new Lenha(bancoItens[itemInd].ID,bancoItens[itemInd].nome,bancoItens[itemInd].valorFogo);
        return(tempItem);
    }
    else
    {
        let TempItem = new Item(bancoItens[itemInd].ID, bancoItens[itemInd].nome,bancoItens[itemInd].requisitosCraft);
        return(TempItem);
    }
    

}

function verificarItemInventorio(idItem)
{

    //verificar por ID.
    //idItem pode ser um unico ID ou array
    //retornará um array com as posições no inventorio caso possua tudo.
    //caso não possua TODOS os itens retornará false

   
    itensPosicao = new Array();
    possuiTudo = true;

        if (Array.isArray(idItem))
        {
            for (x=0; x<idItem.length;x++)
            {
                itemInd = inventorio.map(item => item.ID).indexOf(idItem[x]);
                    if (itemInd == -1)
                    {
                        possuiTudo = false;
                    }
                    else
                    {
                    itensPosicao.push(itemInd);
                    }
                
            }

            if (possuiTudo){return itensPosicao;}
            else {possuiTudo = false;}
            
            
        }
        else 
        {
            itemInd = inventorio.map(item => item.ID).indexOf(idItem);  
            if (itemInd != -1){return itemInd;}
            else {possuiTudo = false;}       
        }
    
    return(possuiTudo);

}


function RemoverItem(idItens, desenhar)
{
    //retorna true se possui TODOS itens a remover (e remove), false do contrário (não remove nada)

    let index = verificarItemInventorio(idItens)     
    
    
        if (index === false)
        {            
            return false;
            //não possui todos os itens
        }
        else
        {
            if(Array.isArray(index))
            {                
                for(x=index.length; x>=0;x--)
                {                  
                    inventorio[index[x]] = null;
                }

                //filtrar
                const inventorioFiltrado = inventorio.filter(element => {
                    return element !== null;
                  });

                  inventorio = inventorioFiltrado;                  
            }
            else
            {
            inventorio.splice(index,1);            
            }
        }
    
    if (desenhar == true)
    {DesenharInventorio();}
    return(true);
    
}


function Comer(alimento)
{    
    if (alimento instanceof Comida)
    {
        //numero de balanceamento
        if (fomeAtual<=-15)
        {
            Log("Você não consegue comer mais nada!"); 
            return;
        }


        else 
        {
            tempoFome(-alimento.fomeSaciada);
            RemoverItem(alimento.ID,true);
            Log("Você comeu " + alimento.nome);
            atualizarStatusPersonagem()
        }
    }
   
}



function CorFundo()
{
    //altera a cor do fundo de acordo com a hora do dia
   
    let corFundo;
    let corTexto;
    if(horaAtual==5) 
    { corFundo='rgb(253, 118, 84)';corTexto='rgb(45,45,45)';} //nascer do sol
    
    if(horaAtual>=6 && horaAtual<=11) 
    { corFundo='rgb(244,235,47)';corTexto='rgb(60,60,60)';} //sol da manha

    if(horaAtual>=12 && horaAtual<=14) 
    { corFundo='rgb(244, 255, 63)';corTexto='rgb(40,40,40)';} //sol a pico     

    if(horaAtual>=15 && horaAtual<=17) 
    { corFundo='rgb(244, 217, 14)';corTexto='rgb(55,55,55)';} //sol final tarde

    if(horaAtual>=17 && horaAtual<=18) 
    { corFundo='rgb(244,158,5)';corTexto='rgb(45,45,45)';} //por do sol

    if(horaAtual>=18 && horaAtual<=19) 
    { corFundo='rgb(216,91,0)';corTexto='rgb(235,235,235)';} //final por do sol

    if(horaAtual>=20 && horaAtual<=24) 
    { corFundo='rgb(61,19,79)',corTexto='rgb(240,240,240)';} //noite

    if(horaAtual>=0 && horaAtual<=03) 
    { corFundo='rgb(61,19,79)',corTexto='rgb(240,240,240)';} //noite
    
    if(horaAtual==04) 
    { corFundo='rgb(216,91,0)';corTexto='rgb(240,240,240)';} //antes do nascer
    
    
    root.style.setProperty('--corTexto',corTexto);

    root.style.setProperty('--corFundo',corFundo);

}


function CalcularRecompensaExplorar(distancia)
{
   
    //NÚMEROS BALANCEAMENTO
    distancia = distancia+1;    
    totalPossibilidades = Math.floor(16/distancia); // O total de possibilidades diminui a medida que a distância aumenta. Ou seja, a chance aumenta.
    /////
    console.log("A chance de CADA um dos " + bancoItens.length + " itens do jogo cairem é de 1 em " + totalPossibilidades);
    

    for(x = 0; x<bancoItens.length; x++)
    {
        
        if ((Math.floor(Math.random() * (totalPossibilidades) ) + 1) == totalPossibilidades)
        {
            //itens craftáveis não são disponíveis na exploração
            if(bancoItens[x].requisitosCraft == undefined && bancoItens[x].requisitoFerramenta == undefined)
            {                
                listaLoot.push(x);            
            }   
            
            else if(bancoItens[x].requisitosCraft == undefined &&  bancoItens[x].requisitoFerramenta != undefined  &&  verificarFerramenta(bancoItens[x].requisitoFerramenta) )
            {        
                listaLoot.push(x); 
            }
                
            
        }        //else {console.log("não foi dessa vez que vc ganhou: " + ListaItensJogo[x]);}
    
    }
        
    
    desenharLoot();
     
 
}

function cliqueListaLoot(botao)
{   
    if(botoesChecadosLoot>9 && botao.checked)
    {
        botao.checked = false;
        return;
    }

    if(botao.checked)
    {botoesChecadosLoot++;}
    else{botoesChecadosLoot--;}
    
    
}

function desenharLoot()
{
    botoesChecadosLoot = 0;
    if(listaLoot.length>0)
    {    for(x = 0; x<listaLoot.length;x++)
        {
            let tag = document.createElement("label");
            let checkItem = document.createElement("input");
            checkItem.type = 'checkbox';
            checkItem.value = bancoItens[listaLoot[x]].ID;
            checkItem.setAttribute('onclick','cliqueListaLoot(this)');

            //checar os 10 primeiros itens sozinho
                if (x<=9) 
                {
                    checkItem.checked = true;
                    botoesChecadosLoot++;
                }
            
            tag.innerHTML = bancoItens[listaLoot[x]].nome;
            tag.appendChild(checkItem);
            containerListaLoot.appendChild(tag);
        }        
        esconderBotoesAoLoot(true);
    }
   
    
}



function esconderBotoesAoLoot(esconder)
{
    //true para esconder, false para mostrar
    let botoesFuncoes = new Array();
    let botoesLoot = new Array();
    let textoAtual;

    Array.prototype.push.apply(botoesLoot, document.querySelectorAll('.botoesLoot'));

    Array.prototype.push.apply(botoesFuncoes, document.querySelectorAll('#statusPersonagem>div>a'));

    Array.prototype.push.apply(botoesFuncoes, document.querySelectorAll('.distanciaExplorar>label'));
    botoesFuncoes.push(document.querySelector('#Explorar'));
    
    if(esconder)
    {
        if(listaLoot.length>10)
        {textoAtual ='Você encontrou tudo isso, mas pode carregar apenas 10 itens. Selecione o que deseja levar:'}
        else{textoAtual='';}
    }
    else 
    {
        textoAtual = 'Do próximo ao mais distante';
    }

    document.querySelector('.distanciaExplorar>div').innerHTML = textoAtual;   

        for(x=0;x<botoesFuncoes.length;x++)
       {
            if(esconder)
            {botoesFuncoes[x].style.display = 'none';}
            else{botoesFuncoes[x].style.display = 'inline-block';}
       }

       for(x=0;x<botoesLoot.length;x++)
       {
            if(esconder)
            {botoesLoot[x].style.display = 'inline-block';}
            else{botoesLoot[x].style.display = 'none';}
       }
}

function levarLoot()
{
    let listaCheck = document.querySelectorAll("#listaLoot>label>input");
   

        for(x=0;x<listaCheck.length;x++)
        {
            if(listaCheck[x].checked)            
            {
                let idBotao = parseInt(listaCheck[x].value);            
                adicionarInventorio(idBotao,true);
            }
        }

        listaLoot = [];

        while (containerListaLoot.firstChild) {
            containerListaLoot.removeChild(containerListaLoot.firstChild);        
        }
        esconderBotoesAoLoot(false);
        esconderRadio();
}

function atualizarStatusPersonagem()
{
    let textoCansaco;
    let textoFome;

    if(horasAcordado < 10)
    {textoCansaco = "Descansado";}
    if(horasAcordado >= 10 && horasAcordado<=19)
    {textoCansaco = "Cansado";}
    if(horasAcordado >= 20 && horasAcordado<=26)
    {textoCansaco = "Muito cansado";}
    if(horasAcordado >= 27 && horasAcordado<=34)
    {textoCansaco = "Exausto";}
    if(horasAcordado >34)
    {textoCansaco = "Completamente exausto";}
   
    
    //valores maior que 0 horas sem comer
    if(fomeAtual>=0 && fomeAtual<4) {textoFome="Satisfeito";}
    if(fomeAtual>=4 && fomeAtual<=12) {textoFome="Com leve fome";}
    if(fomeAtual>=13 && fomeAtual<=20) {textoFome="Com fome";}
    if(fomeAtual>=21 && fomeAtual<=30) {textoFome="Com bastante fome";}
    if(fomeAtual>=31 && fomeAtual<=40) {textoFome="Faminto";}
    if(fomeAtual>=41 && fomeAtual<=50) {textoFome="Muito faminto";}
    if(fomeAtual>50) {textoFome="Completamente faminto";}

    //valores negativos
    if(fomeAtual<0 && tempoFogo>-9) {textoFome="Estômago cheio";}
    if(fomeAtual<=-9 && fomeAtual>=-14) {textoFome="Empanturrado";}
    if(fomeAtual<=-15) {textoFome="Completamente empanturrado";}

    statusPersonagem.innerHTML = textoCansaco + ", " + textoFome;
    

}


function verificarFerramenta(utilidade)
{
    itemInd = inventorio.map(ferramentaArma => ferramentaArma.utilidadeFerramenta).indexOf(utilidade);  
    
    if (itemInd != -1)
    {
        inventorio[itemInd].durabilidade--;
            if(inventorio[itemInd].durabilidade == 0)
            {
                inventorio.splice(itemInd,1);
                DesenharInventorio();
            }        
        return true;
    }
    else 
    {        
        return false;
    } 
}


function GameOver()
{
    const tela =  document.querySelector('body');
    tela.innerHTML = '';

    let msgGameOver = document.createElement("h2");    
    msgGameOver.innerHTML = "A privação de comida deixou-lhe fraco demais para fazer qualquer coisa.<br> Você sobreviveu por " + diasSobrevividos + " dias.<br> Clique para tentar novamente <br>";
    msgGameOver.style.textAlign = 'center';
   

    let botaoGameOver = document.createElement('button');
    botaoGameOver.setAttribute('onclick','newGame()');
    botaoGameOver.innerHTML = "Reiniciar"
    
    msgGameOver.appendChild(botaoGameOver);
    tela.appendChild(msgGameOver);
    

}

function newGame()
{
    document.location.reload(true);
}

window.addEventListener("resize",resize);

function resize()
{
    location.href = telaAtual;
}

function AtualizarTelaAtual(tela)
{
    telaAtual = tela.hash;
}

function InitDB()
{   
    console.log("carregado");
    bancoItens.push(new Item (0,'Pedras Médias'));
    bancoItens.push(new Item (1,'Galhos Finos'));
    bancoItens.push(new Item(2,'Galho Sólido'));
    bancoItens.push(new Item(3,'Cipó'));   
    bancoItens.push(new Item(4,'Bambu'));
    bancoItens.push(new Item(5,'Pedras Pequenas'));
    
    ////Chance dobrada caso tenha bolsa
    bancoItens.push(new Comida(6,'Maça',2));
    bancoItens.push(new Comida(7,'Morango',2));
    bancoItens.push(new Comida(8,'Pera',2));    
    bancoItens.push(new Comida(9,'Cebola',1));
    bancoItens.push(new Comida(10,'Repolho',3));
    bancoItens.push(new Comida(11,'Cenura',3));
    bancoItens.push(new Comida(12,'Beterraba',3)); 
    bancoItens.push(new Comida(44,'Alho-Poró',1));
    bancoItens.push(new Comida(45,'Tomilho',2));  
    bancoItens.push(new Comida(46,'Hortelã',0)); 
    bancoItens.push(new Comida(47,'Alecrim',0)); 
    bancoItens.push(new Comida(48,'Batata-doce',4)); 

    bancoItens.push(new Comida(6,'Maça',2,undefined,'bolsa'));
    bancoItens.push(new Comida(7,'Morango',2,undefined,'bolsa'));
    bancoItens.push(new Comida(8,'Pera',1,undefined,'bolsa'));    
    bancoItens.push(new Comida(9,'Cebola',1,undefined,'bolsa'));
    bancoItens.push(new Comida(10,'Repolho',3,undefined,'bolsa'));
    bancoItens.push(new Comida(11,'Cenura',3,undefined,'bolsa'));
    bancoItens.push(new Comida(12,'Beterraba',3,undefined,'bolsa'));
    bancoItens.push(new Comida(44,'Alho-Poró',1,undefined,'bolsa'));
    bancoItens.push(new Comida(45,'Tomilho',2,undefined,'bolsa'));  
    bancoItens.push(new Comida(46,'Hortelã',0,undefined,'bolsa')); 
    bancoItens.push(new Comida(47,'Alecrim',0,undefined,'bolsa')); 
    bancoItens.push(new Comida(48,'Batata-doce',4,undefined,'bolsa')); 
    
    ///

    
    
    bancoItens.push(new Item(13,'Pedra Média Afiada',[0]));
    bancoItens.push(new Item(14,'Pedra Pequena Afiada',[5]));

    bancoItens.push(new ferramentaArma(15,'Bolsa de Couro','bolsa',10,10,[23,3]));
   
    bancoItens.push(new ferramentaArma(36,'Vara de Pesca','peixe',10,10,[4,3,1]));
    bancoItens.push(new ferramentaArma(16,'Zarabatana','caça',10,10,[4,14,1]));
    

    bancoItens.push(new ferramentaArma(17,'Machadinha ','madeira',10,10,[13,2,3]));
    bancoItens.push(new ferramentaArma(18,'Lança de Caça ','caça1',10,10,[13,2,3]));
    

    bancoItens.push(new Item(19,'Flechas de Madeira',[14,1],''));
    bancoItens.push(new Item(20,'Flechas de Bambu',[14,4],''));

    ////
    bancoItens.push(new Item(21,'Ossos',undefined,'caça'));
    bancoItens.push(new Item(22,'Tendões de Animais',undefined,'caça'));
    bancoItens.push(new Item(23,'Couro de Animal',undefined,'caça'));  
    
    bancoItens.push(new Item(21,'Ossos',undefined,'caça1'));
    bancoItens.push(new Item(22,'Tendões de Animais',undefined,'caça1'));
    bancoItens.push(new Item(23,'Couro de Animal',undefined,'caça1')); 
    
    bancoItens.push(new Item(21,'Ossos',undefined,'caça2'));
    bancoItens.push(new Item(22,'Tendões de Animais',undefined,'caça2'));
    bancoItens.push(new Item(23,'Couro de Animal',undefined,'caça2')); 
    

    ///////


    bancoItens.push(new ferramentaArma(24,'Arco de Ossos com Flechas de Bambu ','caça2',10,10,[19,21,22,23]));
    bancoItens.push(new ferramentaArma(25,'Arco de Ossos com Flechas de Madeira','caça2',10,10,[20,21,22,23]));

    
    
    bancoItens.push(new Comida(26,'Carne crua de Lebre',2,undefined,'caça'));
    bancoItens.push(new Comida(27,'Carne crua de Raposa',2,undefined,'caça'));

    bancoItens.push(new Comida(28,'Carne crua de Javali',2,undefined,'caça1'));
    bancoItens.push(new Comida(28,'Carne crua de Javali',2,undefined,'caça2'));    
    bancoItens.push(new Comida(29,'Carne crua de Lobo',2,undefined,'caça1')); 
    bancoItens.push(new Comida(29,'Carne crua de Lobo',2,undefined,'caça2')); 
    

    bancoItens.push(new Comida(31,'Carne crua de Urso',2,undefined,'caça2'));
    ///////

    //lenhas

    bancoItens.push(new Lenha(32,'Lenha de Bétula',4));
    bancoItens.push(new Lenha(33,'Lenha de Pinheiro',6));
    bancoItens.push(new Lenha(34,'Lenha de Cedro',8));
    bancoItens.push(new Lenha(35,'Lenha de Carvalho',10));

    //peixes    
    bancoItens.push(new Comida(37,'Tilápia',2,undefined,'peixe'));
    bancoItens.push(new Comida(38,'Carpa',2,undefined,'peixe'));

    //assados
    bancoItens.push(new Comida(44,'Tilápia Assada',6,[37]));
    bancoItens.push(new Comida(45,'Carpa Assada',7,[38]));
    bancoItens.push(new Comida(39,'Carne de Lebre Assada',10,[26]));
    bancoItens.push(new Comida(40,'Carne de Raposa Assada',12,[27]));    
    bancoItens.push(new Comida(42,'Carne de Lobo Assada',13,[29])); 
    bancoItens.push(new Comida(41,'Carne de Javali Assada',15,[28]));
    bancoItens.push(new Comida(43,'Carne de Urso Assada',17,[31]));
    
    desenharCraft();
}

function encontrarPorID(id)
{
    //retorna o index de um item no database pelo ID

    let itemInd = bancoItens.map(Item => Item.ID).indexOf(id);  
    return(itemInd);

}

//Banco de dados