
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';


export default function Recipe(props) {
    if (props.toRender) {
        const { toRender } = props;
        console.log("I'm here!: ", toRender.data2);
        console.log("name: ", toRender.data2.name);
        //data2 here comes from server.js
        return (
            <>
                <h2>{toRender.data2.name}</h2>
                <h3>Ingredients:</h3>
                <ul>
                    {toRender.data2.ingredients.map((ingredient, index) => {
                        return (<li key={index} >{ingredient.ingredient} : {ingredient.amount}</li>)
                    })}
                </ul>
                <h3>Instructions: </h3>
                <ul>
                    {
                        toRender.data2.instructions.map((instruction, index) => {
                            return (<li key={index}>{instruction}</li>)
                        })
                    }
                </ul>
            </>
        )
    }
    return (

        <Image src="../assets/Secondary.png" roundedCircle />

    )



}