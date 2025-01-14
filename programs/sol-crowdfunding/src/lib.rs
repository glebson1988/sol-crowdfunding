use anchor_lang::prelude::*;

declare_id!("7s9rxZqqDKkcn2QPvhBszuxEwiR7CPL4sLNdxiQpCKEJ");

#[program]
pub mod sol_crowdfunding {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
