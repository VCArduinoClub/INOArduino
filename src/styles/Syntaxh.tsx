const DarkTheme = () => {
    return (
        <style jsx global>
            {`
       pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em
}

code.hljs {
    padding: 3px 5px
}

.hljs {
    color: #a9b7c6;
    background: #303947
}



.hljs-bullet,
.hljs-literal,
.hljs-number,
.hljs-symbol {
    color: #6897bb
}

.hljs-deletion,
.hljs-keyword,
.hljs-selector-tag {
    color: #cc7832
}

.hljs-link,
.hljs-template-variable,
.hljs-variable {
    color: #629755
}

.hljs-comment,
.hljs-quote {
    color: grey
}

.hljs-meta {
    color: #bbb529
}

.hljs-addition,
.hljs-attribute,
.hljs-string {
    color: #6a8759
}

.hljs-section,
.hljs-title,
.hljs-type {
    color: #ffc66d
}

.hljs-name,
.hljs-selector-class,
.hljs-selector-id {
    color: #e8bf6a
}

.hljs-emphasis {
    font-style: italic
}

.hljs-strong {
    font-weight: 700
}
      `}
        </style>
    );
};

const LightTheme = () => {
    return (
        <style jsx global>
            {`
       pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em
}

code.hljs {
    padding: 3px 5px
}

.hljs {
    background: #f3f4f6;
    color: #434f54
}

.hljs-subst {
    color: #434f54
}

.hljs-attribute,
.hljs-doctag,
.hljs-keyword,
.hljs-name,
.hljs-selector-tag {
    color: #00979d
}

.hljs-addition,
.hljs-built_in,
.hljs-bullet,
.hljs-code,
.hljs-literal {
    color: #d35400
}

.hljs-link,
.hljs-regexp,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-symbol,
.hljs-template-variable,
.hljs-variable {
    color: #00979d
}

.hljs-deletion,
.hljs-quote,
.hljs-selector-class,
.hljs-selector-id,
.hljs-string,
.hljs-template-tag,
.hljs-type {
    color: #005c5f
}

.hljs-comment {
    color: rgba(149, 165, 166, .8)
}

.hljs-meta .hljs-keyword {
    color: #728e00
}

.hljs-meta {
    color: #434f54
}

.hljs-emphasis {
    font-style: italic
}

.hljs-strong {
    font-weight: 700
}

.hljs-function {
    color: #728e00
}

.hljs-section,
.hljs-title {
    color: #800;
    font-weight: 700
}

.hljs-number {
    color: #8a7b52
}
      `}
        </style>
    );
};

export default function Syntaxh({ theme }: { theme: string }) {
    if (theme == "dark") {
        return <DarkTheme />;
    }
    return <LightTheme />;
}
