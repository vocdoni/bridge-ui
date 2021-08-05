/* THIS CODE IS FOR SANDBOXING ONLY. */
/* TODO delete before merging PR */

type RegTokenSectionSectionProps = {
  tokens: string[];
  network: string;
};

const RegTokenSection = ({ tokens, network }: RegTokenSectionSectionProps) => {
  return (
    <>
      <p>
        There are currently {tokens.length} tokens on network {network}.
      </p>
      <p>Their addresses are</p>
      {tokens.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </>
  );
};

export default RegTokenSection;
