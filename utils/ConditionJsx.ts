export function IF(props: { condition: any | boolean; children: any }){
    if(!!props.condition){
        return props.children
    }
    return null
}

